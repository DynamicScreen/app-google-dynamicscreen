<?php


namespace DynamicScreen\Google\GoogleDriver;

use DynamicScreen\SdkPhp\Interfaces\IModule;
use DynamicScreen\SdkPhp\Handlers\OAuthProviderHandler;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class GoogleAuthProviderHandler extends OAuthProviderHandler
{
    protected static string $provider = 'google';

    public function __construct(IModule $module, $config = null)
    {
        parent::__construct($module, $config);
    }

    public function testConnection($config = null)
    {
        $config = $config ?? $this->default_config;

        try {
            $this->getUserInfos($config);
            return response('', 200);
        } catch (\Exception $e) {
            return response('Connection failed', 403);
        }
    }

    public function getUserInfos($config = null)
    {
        $config = $config ?? $this->default_config;

        $client = $this->getGoogleClient($config);
        $google_oauth = new \Google_Service_Oauth2($client);
        return $google_oauth->userinfo->get();
    }

    public function signin($callbackUrl = null)
    {
        $data = Session::get('auth_provider');
        $data = json_encode($data);

        $client = $this->getGoogleClient($callbackUrl);
        $client->setState($data);
        $client->setApprovalPrompt('force');

        $auth_url = $client->createAuthUrl();

        return $auth_url;

    }

    public function callback($request, $redirectUrl = null)
    {
        $client = $this->getGoogleClient($redirectUrl);
        $client->setAccessType('offline');
        $access_token = $client->getAccessToken();

        $options = ['active' => true, 'token' => $access_token->getValue(), 'expires' => $access_token->getExpiresAt()];
        $data = $this->processOptions($options);
        $dataStr = json_encode($data);

        return redirect()->away($redirectUrl ."&data=$dataStr");
    }

    public function getGoogleClient($redirectUrl = null)
    {
        $redirectUrl = $redirectUrl ?? route('api.oauth.callback');

        $client = new \Google_Client();

        $client->setApplicationName(config("services.{$this->getProviderIdentifier()}.app_name"));
        $client->setClientId(config("services.{$this->getProviderIdentifier()}.client_id"));
        $client->setClientSecret(config("services.{$this->getProviderIdentifier()}.client_secret"));
        $client->setAccessType('offline');
        $client->setRedirectUri($redirectUrl);

        $this->refreshToken($client);

        foreach ($this->getScopes() as $scope) {
            $client->addScope($scope);
        }

        return $client;
    }

    public function refreshToken($client)
    {
        if (!$this->default_config) {
            return ;
        }

        try {
            $client->setAccessToken($this->default_config);
        } catch (\InvalidArgumentException $exception) {
            dd($exception, 'e');
            return;
        }

        if ($client->isAccessTokenExpired()) {
            $refresh_token = $client->getRefreshToken();

            $new_access = $client->fetchAccessTokenWithRefreshToken($refresh_token);
            $options = $this->processOptions($new_access);

            // Google failed to provide token: auth failed
            if (!$new_access || !isset($new_access['access_token'])) {
                dd('auth failed provide token');
                return;
            }

            $client->setAccessToken($new_access);
        }

        return $this->processOptions($options);
    }

    protected function getScopes() : array
    {
        return [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/documents.readonly',
            'https://www.googleapis.com/auth/spreadsheets.readonly',
            'https://www.googleapis.com/auth/presentations.readonly ',
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.metadata.readonly',
        ];
    }
}
