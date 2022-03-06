<?php

namespace DynamicScreen\Google\Slide;

use DynamicScreen\SdkPhp\Handlers\SlideHandler;
use DynamicScreen\SdkPhp\Interfaces\ISlide;
use DynamicScreen\Google\Rules\CheckGoogleSlideUrl;

class SlideSlideHandler extends SlideHandler
{

    public function fetch(ISlide $slide): void
    {
        if ($slide->getOption('type') === 'url') {
            $presentation_id = $slide->getOption('fileId');
            $driver = $this->getAuthProvider($slide->getAccounts());

            if ($slide->getOption('use_share_account', true)) {
                $shared_account = $driver;
                $presentation = $shared_account->getPresentation($presentation_id);
                $access_token = $shared_account->getAccessToken();
            } else {
                $account = $driver;
                $access_token = $account->getOption('access_token');
                $driver = $account->getDriver();
                $gclient = $driver->getGoogleClient($account);
                $googleSDK = new \Google_Service_Slides($gclient);
                $presentation = $googleSDK->presentations->get($presentation_id);
            }

            $slide_duration = $slide->duration * 1000;

            if ($slide->getOption('total_duration')) {
                $total_duration = $slide->getOption('total_duration');
            } else {
                if (!$presentation) {
                    return ;
                }
                $total_duration = $slide_duration * count($presentation->getSlides()) + $slide_duration;
            }

            $url = "https://docs.google.com/presentation/d/{$presentation_id}/embed?start=true&loop=true&delayms={$slide_duration}&rm=minimal&access_token=";
            if ($presentation) {
                $this->addSlide([
                    'type' => 'url',
                    'url' => $url,
                    'access_token' => $access_token,
                    'use_share_account' => $slide->getOption('use_share_account', true) ? true : false,
                    'hash' => 'aaa',
                    'media_id' => '',
                    'size' => 100,
                    'duration' => $total_duration,
                ]);
            }
        } else {
            $remoteFileArray = $slide->getOption('remoteFiles', []);
            foreach ($remoteFileArray as $remoteFileId) {
                $remoteFile = $slide->getRemoteFile($remoteFileId);
                if ($remoteFile && $remoteFile->isReady()) {
                    $urls = $remoteFile->metadata('urls');
                    foreach ($urls as $url) {
                        $str_amazon_identifier = explode("/", $url);
                        $slide_identifier = 'dynamicscreen-gslide-' . $str_amazon_identifier[sizeof($str_amazon_identifier) - 1];
                        $this->addSlide([
                            'media' => [
                                'url' => $url,
                                'hash' => 'aaa',
                                'id' => $slide_identifier,
                                'size' => 1,
                                'cachedUrl' => null,
                            ],
                            'type' => 'media',
                            'media_id' => $slide_identifier,
                        ]);
                    }
                }
            }
        }
    }

    public function getAttachedRemoteFiles(SlideContract $slide)
    {
        return $slide->getOption('remoteFiles', []);
    }

    private function getAllOptions()
    {
        $options = $this->request->get('options') ?? [];
        if ($this->request->files->has('options')) {
            $options = array_merge($options, $this->request->files->get('options'));
        }
        return $options;
    }

    public function processOptions($options)
    {
        $options = $slide->getOptions();

        if ($options['type'] === 'url') {
            preg_match('/docs.google.com\/presentation\/d\/(.*)\//', $options['url'], $matches);
            $fileId = isset($matches[1]) ? $matches[1] : null;

            $oldFileId = $slide->getOption('fileId');

            $slide->setOption('type', $options['type']);
            $slide->setOption('account', Arr::get($options, 'account', ""));
            $slide->setOption('use_share_account', $options['use_share_account']);
            $slide->setOption('url', $options['url']);
            $slide->setOption('fileId', $fileId);
            $slide->save();

            if ($fileId !== $oldFileId) {
                $watchGoogleDriveFile = new WatchGoogleSlideUrlAction();
                $watchGoogleDriveFile->watchGoogleDriveFile($slide);
            }

            $lock = \Cache::get("gslide_url_duration.watch-lock-{$slide->id}");
            \Cache::put("url_duration.watch-{$slide->id}", "process option call", 1);
            if (!$lock) {
                \Cache::put("gslide_url_duration.watch-lock-{$slide->id}", "locked", 5);
                $googleSlidesAction = new RequestGSlideUrlDurationAction();
                $googleSlidesAction->call($slide);
            }
        }
        return $options;
    }

    public function getValidations()
    {
        if (request('options.use_share_account')) {
            $account = null;
        } else {
            $account = Account::accessible()->ofDriver(new GoogleAccountDriver())->find(request('options.account'));
        }

        preg_match('/docs.google.com\/presentation\/d\/(.*)\//', request('options.url'), $matches);
        $rules = ['required_if:options.type,url', 'regex:/(^https?:\/\/)?docs.google.com\/presentation\/d\/.*\/edit/', new CheckGoogleSlideUrl($matches[1] ?? null, $account)];

        return [
            'rules' => [
                'options.url' => $rules
            ],
            'messages' => [
                'options.url.required_if' => __('dynamicscreen.g-suite::gslides.slide.required_url'),
                'options.url.regex' => __('dynamicscreen.g-suite::gslides.slide.error_url')
            ],
        ];
    }
}
