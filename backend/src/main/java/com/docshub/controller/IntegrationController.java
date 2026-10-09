package com.docshub.controller;

import com.docshub.dto.request.ConnectRequest;
import com.docshub.dto.response.IntegrationResponse;
import com.docshub.service.IntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/integrations")
@RequiredArgsConstructor
@Slf4j
public class IntegrationController {

    private final IntegrationService integrationService;

    @GetMapping
    public ResponseEntity<List<IntegrationResponse>> getIntegrations(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(integrationService.getIntegrations(userDetails.getUsername()));
    }

    @PostMapping("/{service}/connect")
    public ResponseEntity<IntegrationResponse> connect(
            @PathVariable String service,
            @RequestBody ConnectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(integrationService.connect(userDetails.getUsername(), service, request.getEmail()));
    }

    @DeleteMapping("/{service}")
    public ResponseEntity<Void> disconnect(
            @PathVariable String service,
            @AuthenticationPrincipal UserDetails userDetails) {
        integrationService.disconnect(userDetails.getUsername(), service);
        return ResponseEntity.noContent().build();
    }
}
