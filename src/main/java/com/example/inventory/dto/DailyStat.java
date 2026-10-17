package com.example.inventory.dto;

public class DailyStat {

    private String label;   // e.g. "Mon 06"
    private long count;     // number of products added that day

    public DailyStat(String label, long count) {
        this.label = label;
        this.count = count;
    }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}