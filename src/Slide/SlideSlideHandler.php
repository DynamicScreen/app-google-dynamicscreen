<?php

namespace DynamicScreen\Google\Slide;

use DynamicScreen\SdkPhp\Handlers\SlideHandler;
use DynamicScreen\SdkPhp\Interfaces\ISlide;
use DynamicScreen\Google\Rules\CheckGoogleSlideUrl;
use Illuminate\Support\Arr;

class SlideSlideHandler extends SlideHandler
{

    public function fetch(ISlide $slide): void
    {
        if ($slide->getOption('type') === 'url') {
            $presentation_id = $slide->getOption('fileId');
            $driver = $this->getAuthProvider($slide->getAccounts());

            $access_token = $driver->getOption('access_token');
            $gclient = $driver->getGoogleClient();
            $googleSDK = new \Google_Service_Slides($gclient);

            $presentation = $googleSDK->presentations->get($presentation_id);

            $slide_duration = $slide->getDuration() * 1000;

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
            
            foreach ($remoteFileArray as $remoteFile) {
                if ($remoteFile) {
                    $urls = Arr::get($remoteFile, 'metadata.urls');
                $this->addSlide($remoteFile);
                    return ;
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

    public function getValidations(array $options)
    {

        $driver = $this->getAuthProvider(Arr::get($options, 'accounts', []));

        preg_match('/docs.google.com\/presentation\/d\/(.*)\//', Arr::get($options, 'url', ''), $matches);
        $rules = ['required_if:type,url', 'regex:/(^https?:\/\/)?docs.google.com\/presentation\/d\/.*\/edit/', new CheckGoogleSlideUrl($matches[1] ?? null, $driver)];

        return [
            'rules' => [
                'url' => $rules
            ],
            'messages' => [
                'url.required_if' => __('dynamicscreen.g-suite::gslides.slide.required_url'),
                'url.regex' => __('dynamicscreen.g-suite::gslides.slide.error_url')
            ],
        ];
    }
}
