<?php

namespace DynamicScreen\Google\Doc;

use Carbon\Carbon;
use DynamicScreen\SdkPhp\Handlers\SlideHandler;
use DynamicScreen\SdkPhp\Interfaces\ISlide;

class DocSlideHandler extends SlideHandler
{

    public function fetch(ISlide $slide): void
    {
        foreach ($slide->getOption('remoteFiles') as $remoteFileId) {
            $remoteFile = $slide->getRemoteFile($remoteFileId);
            if ($remoteFile && $remoteFile->isReady()) {
                $pagesCount = $remoteFile->metadata('pagesCount');
                for ($pagesCountIterator = 1; $pagesCountIterator <= $pagesCount; $pagesCountIterator++) {
                    $str_amazon_identifier = explode( "/", $remoteFile->getUrl());
                    $slide_identifier = 'dynamicscreen-gdoc-' . $str_amazon_identifier[sizeof($str_amazon_identifier) - 1] . $pagesCountIterator;
                    $this->addSlide([
                        'url' => $remoteFile->getUrl(),
                        'media_id' => $slide_identifier,
                        'page' => $pagesCountIterator,
                    ]);
                }
            }
        }
    }
}
