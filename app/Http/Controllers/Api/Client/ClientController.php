<?php

namespace App\Http\Controllers\Api\Client;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

abstract class ClientController extends BaseController
{
    use DispatchesJobs, ValidatesRequests;
}
