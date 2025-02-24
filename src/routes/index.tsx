import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import logo from "../logo.svg";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { ref, inView } = useInView();

  const {
    status,
    data,
    error,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["people"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`https://swapi.dev/api/people?page=${pageParam}`);
      const json = await res.json();
      return {
        results: json.results as { name: string }[],
        nextPage: json.next ? pageParam + 1 : null,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="text-center">
      <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
        <img
          src={logo}
          className="h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite]"
          alt="logo"
        />
        {status === "pending" ? (
          <p>Loading...</p>
        ) : status === "error" ? (
          <span>Error: {error.message}</span>
        ) : (
          <>
            <ul>
              {data.pages.map((page, index) => (
                <React.Fragment key={index}>
                  {page.results.map((person) => (
                    <li key={person.name}>{person.name}</li>
                  ))}
                </React.Fragment>
              ))}
            </ul>
            <div>
              <button
                ref={ref}
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
              >
                {isFetchingNextPage
                  ? "Loading more..."
                  : hasNextPage
                    ? "Load Newer"
                    : "Nothing more to load"}
              </button>
            </div>
            <div>
              {isFetching && !isFetchingNextPage
                ? "Background Updating..."
                : null}
            </div>
          </>
        )}
      </header>
    </div>
  );
}
