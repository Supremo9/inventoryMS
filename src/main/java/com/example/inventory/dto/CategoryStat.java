package com.example.inventory.dto;

/**
 * Simple DTO holding a category name and how many products belong to it.
 * Used to build the pie chart on the dashboard.
 */
public class CategoryStat {

    private String category;
    private long count;

    public CategoryStat(String category, long count) {
        this.category = category;
        this.count = count;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}