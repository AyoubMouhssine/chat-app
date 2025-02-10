<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Auth;

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

        $this->sendWelcomeMessage($user);
        
        return response()->json([
            'message' => 'Registration successful.',
        ]);
    }
    
    public function logout(){
        auth()->user()->tokens()->delete();

        return response()->json([
          "message"=>"logged out"
        ]);
    }


    public function sendWelcomeMessage($user){
        $conf = new \RdKafka\Conf();
        $broker = env('KAFKA_BROKER', 'kafka:9092');
        $conf->set('bootstrap.servers', $broker);
        $conf->set('security.protocol', 'plaintext');
        $producer = new \RdKafka\Producer($conf);
        $topic = $producer->newTopic("welcome-email");
    
        $payload = json_encode([
            'email' => $user->email,
            'name'  => $user->name,
        ]);
        
        $topic->produce(RD_KAFKA_PARTITION_UA, 0, $payload);
        $producer->flush(10000);
    }
}
