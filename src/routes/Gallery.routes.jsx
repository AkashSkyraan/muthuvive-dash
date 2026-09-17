import GalleryList from "../pages/gallery/ListGallery";
import Addgallery from "../pages/gallery/AddGallery";

const galleryRoutes = [
  {
    path: "gallery/list",
    element: <GalleryList />,
  },
  {
    path: "gallery/add",
    element: <Addgallery />,
  },
];

export default galleryRoutes;
