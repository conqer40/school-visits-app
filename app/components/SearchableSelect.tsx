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

  const baseStyle: React.CSSProperties = {
    padding: "0.6rem",
    borderRadius: "6px",
    border: "1px solid var(--border, #ccc)",
    fontFamily: "inherit",
    background: "white",
    cursor: "pointer",
    position: "relative",
    minWidth: "140px",
    ...style,
  };

  return (
    <div ref={containerRef} style={{ position: "relative", ...( style.flex ? { flex: style.flex } : {}), ...(style.width ? { width: style.width } : {}) }} className={className}>
      {/* Hidden input to submit the value */}
      <input type="hidden" name={name} value={selected} />
      
      {/* Display button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...baseStyle,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
          width: "100%",
          boxSizing: "border-box",
          flex: undefined,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: selectedOption ? "inherit" : "#999" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span style={{ fontSize: "0.7rem", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "white",
            border: "1px solid var(--border, #ccc)",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            marginTop: "4px",
            maxHeight: "250px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Search input */}
          <div style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 ابحث..."
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontFamily: "inherit",
                fontSize: "0.9rem",
                boxSizing: "border-box",
                outline: "none",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options list */}
          <div style={{ overflowY: "auto", maxHeight: "200px" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "1rem", textAlign: "center", color: "#999", fontSize: "0.85rem" }}>
                لا توجد نتائج
              </div>
            ) : (
              filtered.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  style={{
                    padding: "0.6rem 0.8rem",
                    cursor: "pointer",
                    backgroundColor: option.value === selected ? "#e8f0fe" : "transparent",
                    fontWeight: option.value === selected ? "bold" : "normal",
                    borderBottom: "1px solid #f5f5f5",
                    transition: "background 0.15s",
                    fontSize: "0.9rem",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = option.value === selected ? "#d4e4fc" : "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = option.value === selected ? "#e8f0fe" : "transparent")}
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
          style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
          value=""
          onChange={() => {}}
          required
        />
      )}
    </div>
  );
}
