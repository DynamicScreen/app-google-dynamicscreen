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
        $client = $this->getGoogleClient();

        $ds_uuid = Str::uuid();

        $client->setRedirectUri(route('oauth.callback', ['driver_id' => $this->identifier()]));
        $client->setState($ds_uuid);
        $client->setApprovalPrompt('force');

        $auth_url = $client->createAuthUrl();

        return $auth_url;

    }

    public function callback($request, $redirectUrl = null)
    {
        $state = Session::get($request->input('state'));
        $account = $this->extractAccount($state['account_id']);
        $space_name = $state['space_name'];
        $code = $request->input('code');

        $client = $this->getGoogleClient();
        $client->setAccessType('offline');
        $client->fetchAccessTokenWithAuthCode($code);

        $access_token = $client->getAccessToken();

        $options = ['active' => true, 'token' => $accessToken->getValue(), 'expires' => $accessToken->getExpiresAt()];
        $data = $this->processOptions($options);
        $dataStr = json_encode($data);

        return redirect()->away($redirectUrl ."&data=$dataStr");
    }

    public function getGoogleClient($account = null)
    {
        $client = new Google_Client();

        $client->setApplicationName(config('google.APP_NAME'));
        $client->setClientId(config('google.CLIENT_ID'));
        $client->setClientSecret(config('google.CLIENT_SECRET'));
        $client->setAccessType('offline');

        $client->setRedirectUri(route('oauth.callback', ['driver_id' => $this->identifier()]));

        $this->refreshAccountIfNeeded($client, $account);

        foreach ($this->getScopes() as $scope) {
            $client->addScope($scope);
        }

        return $client;
    }

    /**
     * @param Google_Client $client
     * @param Account        $account
     */
    public function refreshAccountIfNeeded(Google_Client $client, ?Account $account) : void
    {
        if (isset($account)) {
            try {
                $client->setAccessToken($account->options);
            } catch (\InvalidArgumentException $exception) {
                $account->authIsFailing();
                return;
            }

            if ($client->isAccessTokenExpired()) {
                $refresh_token = $client->getRefreshToken();

                $new_access = $client->fetchAccessTokenWithRefreshToken($refresh_token);
                $account->options = $this->processOptions($new_access);

                // Google failed to provide token: auth failed
                if (!$new_access || !isset($new_access['access_token'])) {
                    $account->authIsFailing();
                    return;
                }

                if ($account->save()) {
                    $account->log('Token refreshed');
                }

                $client->setAccessToken($new_access);
            }

            $account->authIsWorking();
        }
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
