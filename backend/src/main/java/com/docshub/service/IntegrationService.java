package com.docshub.service;

import com.docshub.dto.response.IntegrationResponse;
import com.docshub.entity.Integration;
import com.docshub.entity.ServiceType;
import com.docshub.entity.User;
import com.docshub.exception.BadRequestException;
import com.docshub.repository.IntegrationRepository;
import com.docshub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IntegrationService {

    private final IntegrationRepository integrationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<IntegrationResponse> getIntegrations(String username) {
        User user = findUser(username);
        return integrationRepository.findByUserId(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public IntegrationResponse connect(String username, String service, String email) {
        User user = findUser(username);
        ServiceType serviceType = ServiceType.valueOf(service.toUpperCase());

        Integration integration = integrationRepository
                .findByUserIdAndServiceType(user.getId(), serviceType)
                .orElse(Integration.builder()
                        .user(user)
                        .serviceType(serviceType)
                        .build());

        integration.setActive(true);
        integration.setLinkedEmail(email);
        integration.setLinkedAt(LocalDateTime.now());

        integrationRepository.save(integration);
        log.info("User {} connected {} as {}", username, service, email);
        return toResponse(integration);
    }

    @Transactional
    public void disconnect(String username, String service) {
        User user = findUser(username);
        ServiceType serviceType = ServiceType.valueOf(service.toUpperCase());

        integrationRepository.findByUserIdAndServiceType(user.getId(), serviceType)
                .ifPresent(integration -> {
                    integration.setActive(false);
                    integration.setLinkedEmail(null);
                    integrationRepository.save(integration);
                });

        log.info("User {} disconnected {}", username, service);
    }

    private IntegrationResponse toResponse(Integration integration) {
        return IntegrationResponse.builder()
                .id(integration.getId())
                .serviceType(integration.getServiceType())
                .active(integration.isActive())
                .linkedEmail(integration.getLinkedEmail())
                .linkedAt(integration.getLinkedAt())
                .build();
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
