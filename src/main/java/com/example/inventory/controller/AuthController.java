package com.example.inventory.controller;

import com.example.inventory.dto.CategoryStat;
import com.example.inventory.model.Product;
import com.example.inventory.model.User;
import com.example.inventory.service.ProductService;
import com.example.inventory.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class AuthController {

    private final UserService userService;
    private final ProductService productService;

    @Autowired
    public AuthController(UserService userService, ProductService productService) {
        this.userService = userService;
        this.productService = productService;
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        model.addAttribute("user", new User());
        return "register";
    }

    @PostMapping("/register")
    public String registerUser(@Valid @ModelAttribute("user") User user,
                               BindingResult bindingResult,
                               Model model) {
        if (bindingResult.hasErrors()) {
            return "register";
        }
        try {
            userService.registerUser(user);
            return "redirect:/login?success";
        } catch (RuntimeException e) {
            model.addAttribute("error", e.getMessage());
            return "register";
        }
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model, Principal principal) {
        if (!model.containsAttribute("product")) {
            model.addAttribute("product", new Product());
        }

        List<Product> products = productService.getAllProducts();
        model.addAttribute("products", products);
        model.addAttribute("username", principal != null ? principal.getName() : "Guest");

        // ================== ANALYTICS ==================

        // Total products
        long totalProducts = products.size();

        // Total inventory value (price × quantity summed)
        double totalValue = products.stream()
                .filter(p -> p.getPrice() != null && p.getQuantity() != null)
                .mapToDouble(p -> p.getPrice() * p.getQuantity())
                .sum();

        // Low stock count (< 10 units)
        long lowStockCount = products.stream()
                .filter(p -> p.getQuantity() != null && p.getQuantity() < 10)
                .count();

        // Distinct category count
        long categoryCount = products.stream()
                .map(Product::getCategory)
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .count();

        // Category distribution — used for the pie chart
        Map<String, Long> categoryMap = products.stream()
                .filter(p -> p.getCategory() != null && !p.getCategory().isBlank())
                .collect(Collectors.groupingBy(Product::getCategory, Collectors.counting()));

        List<CategoryStat> categoryStats = categoryMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> new CategoryStat(e.getKey(), e.getValue()))
                .toList();

        // Bar chart data: quantity per product (top 8 by quantity)
        List<Product> topProducts = products.stream()
                .filter(p -> p.getQuantity() != null)
                .sorted(Comparator.comparingInt(Product::getQuantity).reversed())
                .limit(8)
                .toList();

        // Send everything to the view
        model.addAttribute("totalProducts", totalProducts);
        model.addAttribute("totalValue", totalValue);
        model.addAttribute("lowStockCount", lowStockCount);
        model.addAttribute("categoryCount", categoryCount);
        model.addAttribute("categoryStats", categoryStats);
        model.addAttribute("topProducts", topProducts);

        return "dashboard";
    }
}