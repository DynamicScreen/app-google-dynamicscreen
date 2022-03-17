<?php

namespace DynamicScreen\Google\Doc;

use Carbon\Carbon;
use DynamicScreen\Google\Rules\CheckGoogleSlideUrl;
use DynamicScreen\SdkPhp\Handlers\SlideHandler;
use DynamicScreen\SdkPhp\Interfaces\ISlide;
use Illuminate\Support\Arr;

class DocSlideHandler extends SlideHandler
{

    public function fetch(ISlide $slide): void
    {
        foreach ($slide->getOption('remoteFiles') as $remoteFile) {
            if ($remoteFile) {
                $pagesCount = Arr::get($remoteFile, 'metadata.pagesCount', 1);
                for ($pagesCountIterator = 1; $pagesCountIterator <= $pagesCount; $pagesCountIterator++) {
                    $str_amazon_identifier = explode( "/", Arr::get($remoteFile, 'url'));
                    $slide_identifier = 'dynamicscreen-gdoc-' . $str_amazon_identifier[sizeof($str_amazon_identifier) - 1] . $pagesCountIterator;
                    $this->addSlide([
                        'url' => Arr::get($remoteFile, 'url'),
                        'media_id' => $slide_identifier,
                        'page' => $pagesCountIterator,
                    ]);
                }
            }
        }
    }

    public function getValidations($options = null): array
    {
        $rules = ['required_if:type,url', 'regex:/(^https?:\/\/)?docs.google.com\/document\/d\/.*\/edit/'];
        
        if (Arr::get($options, 'url')) {
            $driver = $this->getAuthProvider(Arr::get($options, 'accounts', []));
            preg_match('/docs.google.com\/document\/d\/(.*)\//', Arr::get($options, 'url', ''), $matches);
            $rules[] = new CheckGoogleSlideUrl($matches[1] ?? null, $driver);
        }

        return [
            'rules' => [
                'url' => $rules
            ],
            'messages' => [
                'url.required_if' => __('dynamicscreen.g-suite::gdoc.slide.required_url'),
                'url.regex' => __('dynamicscreen.g-suite::gdoc.slide.error_url')
            ],
        ];
    }
}
