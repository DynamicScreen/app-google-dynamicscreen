<?php

namespace DynamicScreen\Google\Doc;

use Carbon\Carbon;
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
}
