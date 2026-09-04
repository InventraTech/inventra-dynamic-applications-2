// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Home from "../pages/Home";

// export default function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Rotas de Login */}
//         <Route path="/" element={<Login/>} />
//         <Route path="/login" element={<Login/>} />

//         {/* Rotas Privadas */}
//         <Route element={<PrivateRoute/>}>
//           <Route path="/overview" element={<Overview/>}/>
//           <Route path="/home" element={<Home/>}/>
//           <Route path="/users" element={<Users/>}/>
//           <Route path="/passwordRecovery" element={<PasswordRecovery/>}/>
//           <Route path="/productTransfer" element={<ProductTransfer/>}/>
//           <Route path="/settings" element={<Settings/>}/>
//           <Route path="/usageHistory" element={<UsageHistory/>}/>
//         </Route>

//         {/* Um 'else' para erros */}
//         <Route path="*" element={<ErrorPage/>}></Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }```