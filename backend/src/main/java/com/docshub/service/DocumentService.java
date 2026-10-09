package com.docshub.service;

import com.docshub.dto.response.DocumentResponse;
import com.docshub.entity.Document;
import com.docshub.entity.ServiceType;
import com.docshub.entity.User;
import com.docshub.exception.BadRequestException;
import com.docshub.exception.ResourceNotFoundException;
import com.docshub.repository.DocumentRepository;
import com.docshub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocuments(String username, String service) {
        User user = findUser(username);
        List<Document> docs;

        if (service != null && !service.isBlank()) {
            ServiceType serviceType = ServiceType.valueOf(service);
            docs = documentRepository.findByUserIdAndServiceType(user.getId(), serviceType);
        } else {
            docs = documentRepository.findByUserId(user.getId());
        }

        return docs.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public DocumentResponse uploadDocument(String username, MultipartFile file, String serviceType) {
        User user = findUser(username);
        ServiceType type = ServiceType.valueOf(serviceType);

        String uid = UUID.randomUUID().toString();
        String externalUrl = generateExternalUrl(type, uid, file.getOriginalFilename());
        String downloadUrl = externalUrl;

        Document document = Document.builder()
                .user(user)
                .name(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .size(file.getSize())
                .externalUrl(externalUrl)
                .downloadUrl(downloadUrl)
                .serviceType(type)
                .externalId(uid)
                .build();

        documentRepository.save(document);
        log.info("Document '{}' uploaded to {} for user {}", file.getOriginalFilename(), serviceType, username);
        return toResponse(document);
    }

    @Transactional
    public void deleteDocument(String username, Long documentId) {
        User user = findUser(username);
        Document document = documentRepository.findByIdAndUserId(documentId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        documentRepository.delete(document);
        log.info("Document {} deleted for user {}", documentId, username);
    }

    private String generateExternalUrl(ServiceType type, String uid, String filename) {
        return switch (type) {
            case GOOGLE_DRIVE -> "https://docs.google.com/document/d/" + uid + "/edit";
            case DROPBOX -> "https://www.dropbox.com/s/" + uid + "/" + filename;
            case ONEDRIVE -> "https://onedrive.live.com/edit.aspx?resid=" + uid;
            case BOX -> "https://app.box.com/file/" + uid;
            case NOTION -> "https://www.notion.so/" + uid;
            default -> "https://storage.docshub.local/" + uid + "/" + filename;
        };
    }

    private DocumentResponse toResponse(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .name(doc.getName())
                .mimeType(doc.getMimeType())
                .size(doc.getSize())
                .externalUrl(doc.getExternalUrl())
                .downloadUrl(doc.getDownloadUrl())
                .serviceType(doc.getServiceType())
                .modifiedAt(doc.getModifiedAt())
                .build();
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
