package com.example.inventory.service;

import com.example.inventory.model.User;
import com.example.inventory.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email already in use.");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /** Update name + email only (no password change). */
    public void updateProfile(User user, String newFullName, String newEmail) {
        // Check for email collision with a different account
        User existing = userRepository.findByEmail(newEmail);
        if (existing != null && !existing.getId().equals(user.getId())) {
            throw new RuntimeException("That email is already used by another account.");
        }
        user.setFullName(newFullName);
        user.setEmail(newEmail);
        userRepository.save(user);
    }

    /** Change password after verifying the current one. */
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /** Save just the profile image path. */
    public void updateProfileImage(User user, String imagePath) {
        user.setProfileImage(imagePath);
        userRepository.save(user);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}