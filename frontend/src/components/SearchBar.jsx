import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// SearchBar Component
export const SearchBar = ({ 
  isVisible, 
  onClose, 
  onSearch, 
  searchQuery, 
  setSearchQuery,
  searchResults,
  currentResultIndex,
  onNavigateResult 
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onNavigateResult('prev');
      } else {
        onNavigateResult('next');
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-12 left-0 right-0 md:static z-50 bg-white border-b border-gray-200 p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-4"
          />
        </div>
        
        {searchQuery && searchResults.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>
              {currentResultIndex + 1} of {searchResults.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateResult('prev')}
              disabled={searchResults.length === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateResult('next')}
              disabled={searchResults.length === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {searchQuery && searchResults.length === 0 && (
        <div className="mt-2 text-sm text-gray-500">
          No messages found
        </div>
      )}
    </div>
  );
};

// SearchHighlight Component
export const SearchHighlight = ({ text, searchQuery }) => {
  if (!searchQuery || !text) return text;

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 px-1 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};