"use client";

import React, { useState, useRef, useEffect } from "react";

interface SearchableSelectProps {
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onChange?: (value: string) => void;
}

export default function SearchableSelect({
  name,
  options,
  defaultValue = "",
  placeholder = "اختر...",
  required = false,
  style = {},
  className = "",
  onChange,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(defaultValue);
  const [isHovered, setIsHovered] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === selected);

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (value: string) => {
    setSelected(value);
    setIsOpen(false);
    setSearch("");
    onChange?.(value);
  };

  // Extract container layout styles from passed style prop
  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: style.width || "100%",
    flex: style.flex,
    minWidth: style.minWidth,
    margin: style.margin,
    marginTop: style.marginTop,
    marginBottom: style.marginBottom,
  };

  // Button specific styles avoiding layout overriding
  const buttonStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.5rem",
    width: "100%",
    padding: style.padding || "0.6rem 0.8rem",
    borderRadius: style.borderRadius || "6px",
    border: isOpen ? "1px solid var(--primary-deep-blue, #2563eb)" : (style.border || "1px solid var(--border, #ccc)"),
    outline: isOpen ? "2px solid rgba(37, 99, 235, 0.2)" : "none",
    background: style.background || "white",
    fontFamily: "inherit",
    fontSize: style.fontSize || "0.95rem",
    color: style.color || "inherit",
    cursor: "pointer",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    boxShadow: isOpen ? "0 0 0 3px rgba(37,99,235,0.1)" : (isHovered ? "0 2px 5px rgba(0,0,0,0.05)" : "none"),
  };

  return (
    <div ref={containerRef} style={containerStyle} className={className}>
      {/* Hidden input to submit the value */}
      <input type="hidden" name={name} value={selected} />
      
      {/* Display button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={buttonStyle}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: selectedOption ? "inherit" : "#888", fontWeight: selectedOption ? "600" : "normal" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span style={{ 
          fontSize: "0.7rem", 
          transform: isOpen ? "rotate(180deg)" : "none", 
          transition: "transform 0.3s ease",
          color: isOpen ? "var(--primary-deep-blue, #2563eb)" : "#666" 
        }}>
          ▼
        </span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "white",
            border: "1px solid var(--border, #ccc)",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {/* Search input */}
          <div style={{ padding: "8px", borderBottom: "1px solid #f0f0f0", background: "#f8f9fa", position: "relative" }}>
            <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: "0.9rem" }}>🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث هنا..."
              style={{
                width: "100%",
                padding: "0.6rem 2rem 0.6rem 0.6rem", // Extra right padding for the icon
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontFamily: "inherit",
                fontSize: "0.9rem",
                boxSizing: "border-box",
                outline: "none",
                background: "white",
                transition: "border-color 0.2s",
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.style.borderColor = "var(--primary-deep-blue, #2563eb)"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          {/* Options list */}
          <div style={{ overflowY: "auto", maxHeight: "280px" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "1.5rem", textAlign: "center", color: "#888", fontSize: "0.9rem" }}>
                لا توجد نتائج مطابقة
              </div>
            ) : (
              filtered.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  style={{
                    padding: "0.7rem 1rem",
                    cursor: "pointer",
                    backgroundColor: option.value === selected ? "#eef2ff" : "transparent",
                    color: option.value === selected ? "var(--primary-deep-blue, #2563eb)" : "auto",
                    fontWeight: option.value === selected ? "bold" : "normal",
                    borderLeft: option.value === selected ? "3px solid var(--primary-deep-blue, #2563eb)" : "3px solid transparent",
                    borderBottom: "1px solid #f8f9fa",
                    transition: "all 0.15s ease",
                    fontSize: "0.95rem",
                  }}
                  onMouseEnter={(e) => {
                    if (option.value !== selected) {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (option.value !== selected) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Required validation */}
      {required && !selected && (
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
          value=""
          onChange={() => {}}
          required
        />
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
