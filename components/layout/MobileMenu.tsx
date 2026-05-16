"use client";
import { House, MessageSquare, User } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MobileMenu = () => {
    const pathname = usePathname();
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

    const menuItems = [
        { name: 'Home', icon: House, path: '/' },
        { name: 'Chat', icon: MessageSquare, path: '/chat' },
        { name: 'Profile', icon: User, path: '/profile' },
    ];

    // Get active index from current path
    const activeIndex = menuItems.findIndex(item => pathname === item.path || pathname?.startsWith(item.path + '/'));

    // Update indicator position
    useEffect(() => {
        const updateIndicator = () => {
            const activeButton = buttonsRef.current[activeIndex];
            const container = containerRef.current;
            
            if (activeButton && container) {
                const buttonRect = activeButton.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                
                // Add padding to make indicator larger but centered
                const padding = 20; // px-4 = 16px
                
                setIndicatorStyle({
                    left: buttonRect.left - containerRect.left - padding,
                    width: buttonRect.width + (padding * 2),
                });
            }
        };

        updateIndicator();
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [activeIndex]);

    return (
        <div className='fixed bottom-0 left-0 right-0 z-50 pb-2 bg-linear-to-t from-(--background) to-transparent'>
            <div className='px-4 pb-4 flex justify-center max-w-350 mx-auto'>
                <div ref={containerRef} className='relative w-full h-14 rounded-full flex justify-around items-center bg-white/50 dark:bg-white/10 backdrop-blur-md shadow-lg'>
                    {/* Sliding Indicator - No padding in className, handle in style */}
                    <div 
                        className={`absolute h-10 rounded-full transition-all duration-300 ease-out ${
                            activeIndex === 0 ? 'bg-primary/20 dark:bg-primary/30' :
                            activeIndex === 1 ? 'bg-secondary/20 dark:bg-secondary/30' :
                            'bg-accent/20 dark:bg-accent/30'
                        }`}
                        style={{
                            left: indicatorStyle.left,
                            width: indicatorStyle.width,
                        }}
                    />
                    
                    {/* Buttons */}
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeIndex === index;
                        
                        return (
                            <Link key={item.name} href={item.path} className='relative z-10 flex-1 flex justify-center'>
                                <button
                                    ref={(el) => { buttonsRef.current[index] = el; }}
                                    className={`transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}
                                >
                                    <Icon 
                                        size={22} 
                                        className={`transition-all duration-200 cursor-pointer ${
                                            isActive 
                                                ? index === 0 ? 'text-primary' : index === 1 ? 'text-secondary' : 'text-accent'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                    />
                                </button>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;