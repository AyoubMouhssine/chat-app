<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Response;
use Storage;

class UserController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => UserResource::collection(User::all()),
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
}
