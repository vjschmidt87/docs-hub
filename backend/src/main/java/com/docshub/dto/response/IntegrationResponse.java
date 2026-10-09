package com.docshub.dto.response;

import com.docshub.entity.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationResponse {
    private Long id;
    private ServiceType serviceType;
    private boolean active;
    private String linkedEmail;
    private LocalDateTime linkedAt;
}
