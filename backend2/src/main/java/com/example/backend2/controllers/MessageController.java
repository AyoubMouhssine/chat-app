package com.example.backend2.controllers;

import com.example.backend2.models.Message;
import com.example.backend2.repositories.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public Message sendMessage(Message message) {
        message.setSentAt(LocalDateTime.now());
        return messageRepository.save(message);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Message>> getMessageHistory(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long currentUserId) {
        List<Message> messages = messageRepository.findMessagesBetweenUsers(currentUserId, userId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Message>> getGroupMessageHistory(@PathVariable Long groupId) {
        List<Message> messages = messageRepository.findByGroupIdOrderBySentAtAsc(groupId);
        return ResponseEntity.ok(messages);
    }
}
