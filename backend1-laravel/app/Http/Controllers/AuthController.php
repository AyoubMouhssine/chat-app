<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Auth;
use Storage;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken( $user->name . 'authToken')->plainTextToken;
    
            return response()->json([
                'message' => 'Login successful.',
                'user' => new UserResource($user),
                'token' => $token,
            ]);
        }
    
        return response()->json(['message' => 'Invalid credentials'], 401);


    }

    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::create($validated);

        return response()->json([
            'message' => 'Registration successful.',
        ]);
    }
    
    public function update(UpdateRequest $request)    {
        $user = Auth::user();
        $validatedData = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar); 
            }

            $imagePath = $request->file('avatar')->store('public/avatars'); 
            $validatedData['avatar'] = $imagePath;
        }

        $user->update($validatedData); 

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => new UserResource($user),
        ]);
    }
    public function logout(){
        auth()->user()->tokens()->delete();

        return response()->json([
          "message"=>"logged out"
        ]);
    }
}
