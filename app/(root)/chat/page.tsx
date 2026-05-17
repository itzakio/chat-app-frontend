"use client"
import SearchBar from '@/components/ui/SearchBar';
import React, { useState } from 'react';

const ChatPage = () => {
  const [filters, setFilters] = useState({
    currentPage: 1,
    perPageItem: 6,
    search: "",
  });
  const handleSearch = (term: string) => {
    setFilters((prev) => ({
      ...prev,
      search: term,
      currentPage: 1,
    }));
  };
  return (
    <div>
      <div className="px-4 py-2">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search for friends..."
          initialValue={filters.search}
          debounceDelay={500}
          size="lg"
          variant="default"
          showClearButton={true}
        />
      </div>
    </div>
    );
};

export default ChatPage;