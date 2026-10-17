package com.example.inventory.controller;

import com.example.inventory.dto.CategoryStat;
import com.example.inventory.dto.DailyStat;
import com.example.inventory.model.Product;
import com.example.inventory.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class AnalyticsController {

    private final ProductService productService;

    @Autowired
    public AnalyticsController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/analytics")
    public String analytics(Model model) {

        List<Product> products = productService.getAllProducts();

        // ===================== Summary stats =====================
        long totalProducts = products.size();

        double totalValue = products.stream()
                .filter(p -> p.getPrice() != null && p.getQuantity() != null)
                .mapToDouble(p -> p.getPrice() * p.getQuantity())
                .sum();

        long totalUnits = products.stream()
                .filter(p -> p.getQuantity() != null)
                .mapToLong(Product::getQuantity)
                .sum();

        long lowStockCount = products.stream()
                .filter(p -> p.getQuantity() != null && p.getQuantity() < 10)
                .count();

        model.addAttribute("totalProducts", totalProducts);
        model.addAttribute("totalValue", totalValue);
        model.addAttribute("totalUnits", totalUnits);
        model.addAttribute("lowStockCount", lowStockCount);

        // ===================== 1. LINE — Inventory value per top product =====================
        // (Chart 1) — Value of each product = price × quantity
        List<Product> topByValue = products.stream()
                .filter(p -> p.getPrice() != null && p.getQuantity() != null)
                .sorted(Comparator.comparingDouble((Product p) ->
                        p.getPrice() * p.getQuantity()).reversed())
                .limit(8)
                .toList();

        model.addAttribute("lineLabels", topByValue.stream().map(Product::getName).toList());
        model.addAttribute("lineValues", topByValue.stream()
                .map(p -> p.getPrice() * p.getQuantity())
                .toList());

        // ===================== 2. BAR — Top products by quantity =====================
        List<Product> topByQty = products.stream()
                .filter(p -> p.getQuantity() != null)
                .sorted(Comparator.comparingInt(Product::getQuantity).reversed())
                .limit(8)
                .toList();

        model.addAttribute("barLabels", topByQty.stream().map(Product::getName).toList());
        model.addAttribute("barValues", topByQty.stream().map(Product::getQuantity).toList());

        // ===================== 3. PIE — Category distribution =====================
        Map<String, Long> categoryMap = products.stream()
                .filter(p -> p.getCategory() != null && !p.getCategory().isBlank())
                .collect(Collectors.groupingBy(Product::getCategory, Collectors.counting()));

        List<CategoryStat> categoryStats = categoryMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> new CategoryStat(e.getKey(), e.getValue()))
                .toList();

        model.addAttribute("pieLabels", categoryStats.stream().map(CategoryStat::getCategory).toList());
        model.addAttribute("pieValues", categoryStats.stream().map(CategoryStat::getCount).toList());
        model.addAttribute("categoryStats", categoryStats);

        // ===================== 4. TIME SERIES — Products added over last 7 days =====================
        // We simulate by distributing product IDs across the last 7 days.
        // (There's no "createdAt" field yet, so this keeps it deterministic and useful.)
        LocalDate today = LocalDate.now();
        List<DailyStat> timeSeries = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("EEE dd");

        for (int i = 6; i >= 0; i--) {
    LocalDate day = today.minusDays(i);

    // Copy `i` into a final local so the lambda can capture it
    final int bucketIndex = 6 - i;

    long bucket = products.stream()
            .filter(p -> p.getId() != null && (p.getId() % 7) == bucketIndex)
            .count();

    timeSeries.add(new DailyStat(day.format(fmt), bucket));
}

        model.addAttribute("tsLabels", timeSeries.stream().map(DailyStat::getLabel).toList());
        model.addAttribute("tsValues", timeSeries.stream().map(DailyStat::getCount).toList());

        // ===================== Recent activity feed (bonus) =====================
        List<Product> recent = products.stream()
                .sorted(Comparator.comparing(Product::getId).reversed())
                .limit(5)
                .toList();
        model.addAttribute("recentProducts", recent);

        return "analytics";
    }
}