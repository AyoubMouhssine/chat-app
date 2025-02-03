<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateAvatarRequest;
use App\Http\Requests\UpdateRequest;
use App\Http\Resources\GroupResource;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\User;
use Auth;
use Hash;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Response;
use Storage;

class UserController extends Controller
{
    public function index()
    {
        $users = User::where('id', '!=', auth()->id())->get();
        
        return response()->json([
            'data' => UserResource::collection($users),
            'message' => 'Users retrieved successfully.',
        ]);
    }

    public function show(User $user): JsonResponse
    {
        return Response()->json([
            "user" => new UserResource($user),
            "message" => "User retrieved successfully."
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }
        $user->delete();
        return response()->json([
            'message' => 'User deleted successfully.',
        ], 204);
    }


    public function groups(): JsonResponse{
        $user = Auth::user();
        return response()->json([
            'data' => GroupResource::collection($user->groups),
            'message' => 'User groups retrieved successfully.',
        ]);
    }

    public function update(UpdateRequest $request)
    {
        $user = Auth::user();
        $validatedData = $request->validated();
    
        $updateData = [
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
        ];
    
        if (isset($validatedData['status'])) {
            $updateData['status'] = $validatedData['status'];
        }
    
        if (isset($validatedData['newPassword']) && Hash::check($validatedData['currentPassword'], $user->getAuthPassword())) {
            $updateData['password'] = Hash::make($validatedData['newPassword']);
        } elseif (isset($validatedData['newPassword']) && !Hash::check($validatedData['currentPassword'], $user->getAuthPassword())) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 400);
        }
    
        $user->update($updateData);
    
        return response()->json([
            'message' => 'User updated successfully.',
            'user' => new UserResource($user),
        ]);
    }
    
    

    public function updateAvatar(UpdateAvatarRequest $request): JsonResponse
    {
        $user = Auth::user();
        if ($user->getRawOriginal('avatar') && Storage::disk('public')->exists($user->getRawOriginal('avatar'))) {
            Storage::disk('public')->delete($user->getRawOriginal('avatar'));
        }
    
        $imagePath = $request->file('avatar')->store('avatars', 'public');
    
        $user->update(['avatar' => $imagePath]);
    
        return response()->json([
            'message' => 'Avatar updated successfully.',
            'data' => [
                'avatar' => $user->avatar
            ]
        ]);
    }
}
