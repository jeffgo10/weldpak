'use client';

import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: 'fas fa-sun' },
    { value: 'dark', label: 'Dark', icon: 'fas fa-moon' },
    { value: 'system', label: 'System', icon: 'fas fa-desktop' },
  ] as const;

  const currentTheme = themeOptions.find(option => option.value === theme);

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="outline-secondary"
        size="sm"
        className="d-flex align-items-center gap-2"
        id="theme-toggle"
      >
        <i className={currentTheme?.icon}></i>
        <span className="d-none d-md-inline">{currentTheme?.label}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {themeOptions.map((option) => (
          <Dropdown.Item
            key={option.value}
            onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
            active={theme === option.value}
            className="d-flex align-items-center gap-2"
          >
            <i className={option.icon}></i>
            {option.label}
            {theme === option.value && (
              <i className="fas fa-check ms-auto text-success"></i>
            )}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ThemeToggle;
