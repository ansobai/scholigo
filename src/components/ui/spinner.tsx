'use client'

export function Spinner() {
    return (
        <div className="flex justify-center items-center h-full">
            <svg
                className="animate-spin h-5 w-5 text-gray-500"
                xmlns="http://www.w3.org/
                2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8 8 0 0012 20v-4a4 4 0 00-4-4V7.708z"
                />
            </svg>
        </div>
    );
}