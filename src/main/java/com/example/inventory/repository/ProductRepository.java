package com.example.inventory.repository;

import com.example.inventory.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Built-in methods:
    // - findAll()       → get all products
    // - findById(id)    → get one product
    // - save(product)   → insert or update
    // - deleteById(id)  → delete by id
}