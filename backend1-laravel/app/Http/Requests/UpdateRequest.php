<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $this->user()->id],
            'status' => ['sometimes', 'string', 'nullable', 'in:online,offline'],
            'currentPassword' => ['sometimes', 'required_with:newPassword', 'current_password'],
            'newPassword' => ['sometimes', 'required_with:currentPassword', 'min:8'],
        ];
    }
    
}
