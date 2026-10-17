package com.example.inventory.service;

import com.example.inventory.model.Product;
import com.example.inventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // READ - all
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // READ - one
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    // CREATE + UPDATE (save handles both)
    public void saveProduct(Product product) {
        productRepository.save(product);
    }

    // DELETE
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}