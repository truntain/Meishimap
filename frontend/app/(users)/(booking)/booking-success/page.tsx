'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAppLanguage, detailCopy, bookingSuccessCopy } from '@/config/i18n';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const { language } = useAppLanguage();
  const copy = detailCopy[language];
  const successCopy = bookingSuccessCopy[language];

  const restaurantId = searchParams.get('restaurantId') || '1';
  const restaurantName = searchParams.get('restaurantName') || (language === 'ja' ? 'レストラン' : 'Nhà hàng');
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const guestsParam = searchParams.get('guests') || '2';
  const guestsNum = parseInt(guestsParam) || 2;
  const guestsDisplay = guestsNum === 5
    ? successCopy.guestsMoreFormat
    : successCopy.guestsFormat.replace('{{count}}', String(guestsNum));

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-[#FAF6F0] to-[#F0E6DF] min-h-[70vh]">
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-[#DAC2B6]/40 text-center animate-fade-in">

        {/* Tiêu đề trạng thái */}
        <h1 className="text-3xl font-extrabold text-[#6C2F00] tracking-tight mb-4 pt-4">
          {successCopy.title}
        </h1>

        {/* Nội dung thông báo */}
        <p className="text-base text-gray-600 font-medium mb-8 leading-relaxed px-2">
          {successCopy.description}
        </p>

        {/* Booking Info Box */}
        <div className="bg-[#FAF6F0] rounded-xl p-5 mb-8 border border-[#DAC2B6]/30 text-left space-y-3.5">
          <div className="flex justify-between items-center border-b border-[#DAC2B6]/20 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {successCopy.restaurant}
            </span>
            <span className="text-sm font-bold text-[#6C2F00]">
              {restaurantName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-0.5">
                {copy.date}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {date}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-0.5">
                {copy.time}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {time}
              </span>
            </div>
          </div>

          <div className="border-t border-[#DAC2B6]/20 pt-2 flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {copy.guests}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {guestsDisplay}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/restaurant/${restaurantId}`}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-[#6C2F00]/30 hover:border-[#6C2F00] text-[#6C2F00] font-semibold text-sm rounded-xl transition duration-200"
          >
            {successCopy.backToRestaurant}
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-[#6C2F00] hover:bg-[#8A3E03] text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition duration-200"
          >
            {copy.home}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-[#FAF6F0] to-[#F0E6DF] min-h-[70vh]">
        <div className="text-gray-500 font-medium text-sm animate-pulse">Loading booking summary...</div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}