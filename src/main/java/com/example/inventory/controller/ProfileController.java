package com.example.inventory.controller;

import com.example.inventory.model.User;
import com.example.inventory.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.Set;
import java.util.UUID;

@Controller
@RequestMapping("/profile")
public class ProfileController {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final UserService userService;

    @Autowired
    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    /* ============ VIEW ============ */
    @GetMapping
    public String showProfile(Model model, Principal principal) {
        User user = userService.findByEmail(principal.getName());
        model.addAttribute("user", user);
        return "profile";
    }

    /* ============ UPDATE NAME + EMAIL ============ */
    @PostMapping("/info")
    public String updateInfo(@RequestParam String fullName,
                             @RequestParam String email,
                             Principal principal,
                             RedirectAttributes ra) {
        try {
            User user = userService.findByEmail(principal.getName());
            userService.updateProfile(user, fullName, email);
            ra.addFlashAttribute("successMsg", "Profile updated.");
        } catch (RuntimeException e) {
            ra.addFlashAttribute("errorMsg", e.getMessage());
        }
        return "redirect:/profile";
    }

    /* ============ CHANGE PASSWORD ============ */
    @PostMapping("/password")
    public String changePassword(@RequestParam String currentPassword,
                                 @RequestParam String newPassword,
                                 @RequestParam String confirmPassword,
                                 Principal principal,
                                 RedirectAttributes ra) {

        if (newPassword.length() < 6) {
            ra.addFlashAttribute("errorMsg", "New password must be at least 6 characters.");
            return "redirect:/profile";
        }
        if (!newPassword.equals(confirmPassword)) {
            ra.addFlashAttribute("errorMsg", "New passwords don't match.");
            return "redirect:/profile";
        }

        try {
            User user = userService.findByEmail(principal.getName());
            userService.changePassword(user, currentPassword, newPassword);
            ra.addFlashAttribute("successMsg", "Password changed.");
        } catch (RuntimeException e) {
            ra.addFlashAttribute("errorMsg", e.getMessage());
        }
        return "redirect:/profile";
    }

    /* ============ UPLOAD IMAGE ============ */
    @PostMapping("/image")
    public String uploadImage(@RequestParam("image") MultipartFile file,
                              Principal principal,
                              RedirectAttributes ra) {

        if (file.isEmpty()) {
            ra.addFlashAttribute("errorMsg", "Please select a file.");
            return "redirect:/profile";
        }

        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf('.') + 1).toLowerCase()
                : "";

        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            ra.addFlashAttribute("errorMsg", "Only JPG, PNG, GIF, or WEBP files are allowed.");
            return "redirect:/profile";
        }

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String filename = UUID.randomUUID() + "." + ext;
            Path target = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            User user = userService.findByEmail(principal.getName());
            userService.updateProfileImage(user, "/uploads/" + filename);
            ra.addFlashAttribute("successMsg", "Profile image updated.");
        } catch (IOException e) {
            ra.addFlashAttribute("errorMsg", "Upload failed: " + e.getMessage());
        }

        return "redirect:/profile";
    }

    /* ============ REMOVE IMAGE ============ */
    @PostMapping("/image/remove")
    public String removeImage(Principal principal, RedirectAttributes ra) {
        User user = userService.findByEmail(principal.getName());
        userService.updateProfileImage(user, null);
        ra.addFlashAttribute("successMsg", "Profile image removed.");
        return "redirect:/profile";
    }
}