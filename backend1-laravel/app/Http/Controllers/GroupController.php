<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGroupRequest;
use App\Http\Resources\GroupResource;
use App\Http\Resources\UserResource;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroupController extends Controller
{

    public function index()
    {
        return GroupResource::collection(Group::all());
    }

    public function store(StoreGroupRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        $memberIds = array_unique([...$validatedData['memberIds'], auth()->id()]);

        $group = Group::create([
            'name' => $validatedData['name'],
            'description' => $validatedData['description'] ?? null,
            'created_by' => auth()->id(),
        ]);

        $members = [];
        foreach ($memberIds as $id) {
            $members[$id] = ['role' => $id == auth()->id() ? 'admin' : 'member'];
        }

        $group->users()->attach($members);

        return response()->json([
            'message' => 'Group created successfully.',
            'group' => new GroupResource($group),
        ], 201);
    }

    public function destroy(Group $group)
    {
        $group->users()->detach();
        $group->delete();

        return response()->json([
            'message' => 'Group deleted successfully.',
        ], 204);
    }

    public function addUserToGroup(Group $group, Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $user = User::findOrFail($request->user_id);

        if ($group->users->contains($user)) {
            return response()->json([
                'message' => 'User is already a member of this group.',
            ], 400);
        }

        $group->users()->attach($user->id, ['role' => 'member']);

        return response()->json([
            'message' => 'User added to group successfully.',
        ], 201);
    }

    public function getUsersOfGroup(Group $group, Request $request): JsonResponse
    {
        return response()->json([
            'data' => UserResource::collection($group->users()->withPivot('role')->get()),
            'message' => 'Users of the group retrieved successfully.'
        ]);
    }
}
