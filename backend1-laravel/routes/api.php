<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



Route::post('/login', [AuthController::class,'login'])->name('login');
Route::post('/register', [AuthController::class,'register'])->name('register');


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout',[AuthController::class,'logout']);
    Route::put('/update', [AuthController::class,'update']);
});

Route::get('/users', [UserController::class,'index'])->name('users.index');
Route::get("/users/{user}", [UserController::class,"show"])->name("users.show");
Route::delete('/users/{user}', [UserController::class,'destroy'])->name('users.destroy');