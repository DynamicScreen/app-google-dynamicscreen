<?php

namespace DynamicScreen\Google\Rules;

use Google_Service_Drive;
use Illuminate\Contracts\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use GuzzleHttp\Client;
use Psy\Exception\ErrorException;
use Throwable;

class CheckGoogleSlideUrl implements Rule
{
    protected $fileId;
    protected $drive;
    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct($fileId, $handler = null)
    {
        $this->fileId = $fileId;

        if ($account) {
            $driver = $account->getDriver();
            $gclient = $driver->getGoogleClient($account);
            $this->drive = new Google_Service_Drive($gclient);
        }
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string $attribute
     * @param  mixed $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        try {
            $this->drive->files->get($this->fileId, ['supportsAllDrives' => true]);

            return true;
        } catch (Throwable $e) {
            report($e);
            return false;
        }
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'invalid google slide url (may not supports "supportsAllDrives"';
    }
}
