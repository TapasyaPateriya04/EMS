package com.ems.auth;

import com.ems.employee.Employee;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${ems.jwt.secret}") String base64Secret,
            @Value("${ems.jwt.expiration}") long expirationMs
    ) {
        byte[] keyBytes = Decoders.BASE64.decode(base64Secret);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("EMS_JWT_SECRET must decode to at least 32 bytes.");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    public String issueToken(Employee employee) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(employee.getEmail())
                .claim("role", employee.getRole().name())
                .claim("tokenVersion", employee.getTokenVersion())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(signingKey)
                .compact();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public int extractTokenVersion(String token) {
        return parseClaims(token).get("tokenVersion", Integer.class);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
