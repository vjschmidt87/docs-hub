package com.docshub.repository;

import com.docshub.entity.Integration;
import com.docshub.entity.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IntegrationRepository extends JpaRepository<Integration, Long> {
    List<Integration> findByUserId(Long userId);
    Optional<Integration> findByUserIdAndServiceType(Long userId, ServiceType serviceType);
    void deleteByUserIdAndServiceType(Long userId, ServiceType serviceType);
}
