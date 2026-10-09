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
public class DocumentResponse {
    private Long id;
    private String name;
    private String mimeType;
    private Long size;
    private String externalUrl;
    private String downloadUrl;
    private ServiceType serviceType;
    private LocalDateTime modifiedAt;
}
