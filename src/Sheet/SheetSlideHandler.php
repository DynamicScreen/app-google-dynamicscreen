<?php

namespace DynamicScreen\Google\Sheet;

use Carbon\Carbon;
use DynamicScreen\SdkPhp\Handlers\SlideHandler;
use DynamicScreen\SdkPhp\Interfaces\ISlide;
use Illuminate\Support\Arr;

class SheetSlideHandler extends SlideHandler
{
    public function fetch(ISlide $slide): void
    {
        foreach ($slide->getOption('remoteFiles') as $remoteFile) {
            if ($remoteFile) {
                $pagesCount = Arr::get($remoteFile, 'metadata.pagesCount', 1);
                for ($pagesCountIterator = 1; $pagesCountIterator <= $pagesCount; $pagesCountIterator++) {
                    $str_amazon_identifier = explode( "/", Arr::get($remoteFile, 'url'));
                    $slide_identifier = 'dynamicscreen-gsheet-' . $str_amazon_identifier[sizeof($str_amazon_identifier) - 1] . $pagesCountIterator;
                    $this->slide([
                        'url' => Arr::get($remoteFile, 'url'),
                        'media_id' => $slide_identifier,
                        'page' => $pagesCountIterator,
                    ]);
                }
            }
        }
    }

    // public function processOptions($options)
    // {
    //     $slide = app('slide');
        
    //     if ($options['type'] === 'url') {
    //         preg_match('/docs.google.com\/spreadsheets\/d\/(.*)\//', $options['url'], $matches);
    //         $fileId = $matches[1];
    //         $slide->setOption('fileId', $fileId);
            
    //         preg_match('/[#&]gid=([0-9]+)/', $options['url'], $matches);
    //         $gid = $matches[1] ?? null;
    //         $slide->setOption('gid', $gid);
            
    //         if ($options['use_share_account']) {
    //             $filename = app(SharedGoogleAccount::class)->getSpreadsheet($fileId)->properties->title;
    //             $account_id = null;
    //         } else {
    //             $account = Account::findOrFail($options['account']);
    //             $account_id = $account->id;
    //             $driver = $account->getDriver();
    //             $gclient = $driver->getGoogleClient($account);
    //             $googleSDK = new \Google_Service_Sheets($gclient);
    //             $filename = $googleSDK->spreadsheets->get($fileId)->properties->title;
    //         }
            
    //         $remoteFile = RemoteFile::firstOrNew(['filename' => $fileId, 'space_id' => current_space()->id]);

    //         if (!$remoteFile->exists) {
    //             $remoteFile->space_id = current_space()->id;
    //             $remoteFile->type = 'dynamicscreen.google-drive.sheet';
    //             $remoteFile->disk = config('dynamicscreen.uploads_target');
    //         }
            

    //         $remoteFile->account_id = $account_id;
    //         $remoteFile->setMetadata('filename', $filename);
    //         $remoteFile->save();

    //         $slide->setOption('remoteFiles', array($remoteFile->id));
    //     } else {
    //         $remoteFileId = Arr::get($options, 'remoteFiles')[0];
    //         $remoteFile = RemoteFile::currentSpace()->findOrFail($remoteFileId);
    //         if ($remoteFile) {
    //             $remoteFile->account_id = Arr::get($options, 'account');
    //             $remoteFile->save();
    //         }
    //         $gid = null;
    //         $slide->setOption('gid', $gid);
    //     }

    //     if ($remoteFile) {
    //         $remoteFile->slides->each(function (Slide $slide) use ($options, $gid) {
    //             $opt = $slide->options;
    //             $opt['export'] = $options['export'];
    //             $opt['gid'] = $gid;
    //             $slide->options = $opt;
    //             $slide->saveQuietly();
    //         });

    //     }

    //     return $options;
    // }
}
