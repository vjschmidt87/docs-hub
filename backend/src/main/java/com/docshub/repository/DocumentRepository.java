package com.docshub.repository;

import com.docshub.entity.Document;
import com.docshub.entity.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserId(Long userId);
    List<Document> findByUserIdAndServiceType(Long userId, ServiceType serviceType);
    Optional<Document> findByIdAndUserId(Long id, Long userId);
}
