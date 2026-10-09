package com.docshub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "integrations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "service_type"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Integration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false)
    private ServiceType serviceType;

    @Column(name = "is_active")
    private boolean active;

    @Column(name = "linked_email")
    private String linkedEmail;

    @Column(name = "linked_at")
    private LocalDateTime linkedAt;

    @PrePersist
    protected void onCreate() {
        linkedAt = LocalDateTime.now();
    }
}
