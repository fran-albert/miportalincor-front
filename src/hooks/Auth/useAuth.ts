// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { Role } from "@/common/enums/role.enum";

// const useAuth = (allowedRoles: Role[]) => {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [isAuthLoading, setIsAuthLoading] = useState(true);

//   useEffect(() => {
//     if (status === "loading") return;

//     if (!session) {
//       router.push("/iniciar-sesion");
//     } else {
//       const roles = session?.user?.role ?? [];
//       const hasAccess = allowedRoles.some(role => roles.includes(role));

//       if (!hasAccess) {
//         router.push("/inicio");
//       } else {
//         setIsAuthLoading(false);
//       }
//     }
//   }, [status, session, router, allowedRoles]);

//   useEffect(() => {
//     if (status !== "loading" && session) {
//       setIsAuthLoading(false);
//     }
//   }, [status, session]);

//   return isAuthLoading;
// };

// export default useAuth;
