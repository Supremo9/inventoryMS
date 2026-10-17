package com.example.inventory.controller;

import com.example.inventory.model.Product;
import com.example.inventory.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // ================= LIST (READ) =================
    @GetMapping
    public String listProducts(@RequestParam(value = "q", required = false) String q,
                               Model model) {
        List<Product> products = productService.getAllProducts();

        if (q != null && !q.isBlank()) {
            String needle = q.toLowerCase();
            products = products.stream()
                    .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(needle))
                              || (p.getCategory() != null && p.getCategory().toLowerCase().contains(needle)))
                    .toList();
        }

        model.addAttribute("products", products);
        model.addAttribute("query", q == null ? "" : q);

        if (!model.containsAttribute("newProduct")) {
            model.addAttribute("newProduct", new Product());
        }
        // The edit panel binds against this empty Product; JS fills it.
        if (!model.containsAttribute("editProduct")) {
            model.addAttribute("editProduct", new Product());
        }

        long lowStock = products.stream()
                .filter(p -> p.getQuantity() != null && p.getQuantity() < 10)
                .count();

        model.addAttribute("totalCount", products.size());
        model.addAttribute("lowStockCount", lowStock);

        return "products";
    }

    // ================= CREATE =================
    @PostMapping("/save")
    public String saveProduct(@Valid @ModelAttribute("newProduct") Product product,
                              BindingResult bindingResult,
                              Model model,
                              RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            return reloadWithErrors(model, "create");
        }
        productService.saveProduct(product);
        redirectAttributes.addFlashAttribute("successMsg", "Product \"" + product.getName() + "\" added.");
        return "redirect:/products";
    }

    // ================= UPDATE =================
    @PostMapping("/update/{id}")
    public String updateProduct(@PathVariable Long id,
                                @Valid @ModelAttribute("editProduct") Product product,
                                BindingResult bindingResult,
                                Model model,
                                RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            return reloadWithErrors(model, "edit");
        }
        product.setId(id);
        productService.saveProduct(product);
        redirectAttributes.addFlashAttribute("successMsg", "Product \"" + product.getName() + "\" updated.");
        return "redirect:/products";
    }

    // ================= DELETE =================
    @PostMapping("/delete/{id}")
    public String deleteProduct(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        Product product = productService.getProductById(id);
        String name = product.getName();
        productService.deleteProduct(id);
        redirectAttributes.addFlashAttribute("successMsg", "Product \"" + name + "\" deleted.");
        return "redirect:/products";
    }

    // ---------- helper for re-rendering with errors ----------
    private String reloadWithErrors(Model model, String openPanel) {
        List<Product> products = productService.getAllProducts();
        model.addAttribute("products", products);
        model.addAttribute("query", "");
        model.addAttribute("openPanel", openPanel);
        model.addAttribute("totalCount", products.size());
        model.addAttribute("lowStockCount", products.stream()
                .filter(p -> p.getQuantity() != null && p.getQuantity() < 10).count());
        if (!model.containsAttribute("newProduct")) {
            model.addAttribute("newProduct", new Product());
        }
        if (!model.containsAttribute("editProduct")) {
            model.addAttribute("editProduct", new Product());
        }
        return "products";
    }
}