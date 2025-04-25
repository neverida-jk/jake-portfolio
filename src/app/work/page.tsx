import React from 'react';
// Import your component
import NavigationButton from '../components/ui/NavigationButton';
import Navbar from '../components/layout/Navbar';
import ProjectsCard from '../components/ui/ProjectsCard';

export default function DevelopmentPage() {
  return (
    <div className="flex flex-col">
      <ProjectsCard 
      href="/work"
      date='May 19, 2024' 
      projectTitle='Portfolio.dev' 
      description='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus venenatis bibendum maximus. Phasellus at hendrerit diam, facilisis tristique purus. Morbi sed turpis viverra, ultricies diam sit amet, varius nunc. Donec tincidunt, metus id tincidunt viverra, eros lectus cursus sapien, et luctus libero neque vitae justo. Nam vitae quam metus. Nullam vulputate tellus consectetur elit ultrices imperdiet. Fusce sed eros iaculis, blandit erat a, porttitor risus. Ut luctus, orci vitae varius suscipit, nunc arcu cursus velit, eu sodales dui ex at ligula. Vivamus eget tortor fringilla, maximus ligula quis, venenatis quam.'></ProjectsCard>
      <ProjectsCard 
            href="/projectsss"
      date='May 19, 2024' 
      projectTitle='Portfolio.dev' 
      description='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus venenatis bibendum maximus. Phasellus at hendrerit diam, facilisis tristique purus. Morbi sed turpis viverra, ultricies diam sit amet, varius nunc. Donec tincidunt, metus id tincidunt viverra, eros lectus cursus sapien, et luctus libero neque vitae justo. Nam vitae quam metus. Nullam vulputate tellus consectetur elit ultrices imperdiet. Fusce sed eros iaculis, blandit erat a, porttitor risus. Ut luctus, orci vitae varius suscipit, nunc arcu cursus velit, eu sodales dui ex at ligula. Vivamus eget tortor fringilla, maximus ligula quis, venenatis quam.'></ProjectsCard>
    </div>
    
  );
}