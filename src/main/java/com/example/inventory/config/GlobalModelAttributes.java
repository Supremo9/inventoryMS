package com.example.inventory.config;

import com.example.inventory.model.User;
import com.example.inventory.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.security.Principal;

@ControllerAdvice
public class GlobalModelAttributes {

    private final UserService userService;

    @Autowired
    public GlobalModelAttributes(UserService userService) {
        this.userService = userService;
    }

    @ModelAttribute("username")
    public String currentUsername(Principal principal) {
        return principal != null ? principal.getName() : "Guest";
    }

    @ModelAttribute("currentUser")
    public User currentUser(Principal principal) {
        if (principal == null) return null;
        return userService.findByEmail(principal.getName());
    }
}