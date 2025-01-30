package com.example.backend2.repositories;

import com.example.backend2.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository  extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE " +
            "(m.senderId = :user1Id AND m.receiverId = :user2Id) OR " +
            "(m.senderId = :user2Id AND m.receiverId = :user1Id) " +
            "ORDER BY m.sentAt ASC")
    List<Message> findMessagesBetweenUsers(
            @Param("user1Id") Long user1Id,
            @Param("user2Id") Long user2Id
    );

    List<Message> findByGroupIdOrderBySentAtAsc(Long groupId);
}
