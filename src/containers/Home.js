import React, { useState, useEffect } from "react";
import { ListGroup, ListGroupItem, Badge, Nav, Button } from "react-bootstrap";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import "./Home.css";
import { API, Auth } from "aws-amplify";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";


export default function Home() {
  const [projects, setProjects] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        //return;
      }

      try {
        const projects = await loadProjects();
        projects.sort((a, b) => {
          if (a.createdAt < b.createdAt)
            return 1;
          if (a.createdAt > b.createdAt)
            return -1;
          return 0;
        });

        /*         let activeProjects = projects.filter(function (element) {
                  return element.active == true;
                }); */

        //console.log(projects);
        setProjects(projects);
        //setActiveProjects(activeProjects);
      } catch (e) {
        onError(e);
      }

      setIsLoading(false);
    }

    onLoad();
  }, [isAuthenticated]);

  async function loadProjects() {
    if (isAuthenticated) {
      const currUser = await Auth.currentAuthenticatedUser();
      //console.log(currUser);
      if (currUser.attributes["custom:role"] === "admin") {
        //console.log("admin: get all projects");
        return API.get("projects", "/projects/all");
      }
    }

    //console.log("user: get user projects");
    return API.get("projects", "/projects");
  }

  function renderProjectsList(projects) {
    return [{}].concat(projects).map((project, i) =>
      i !== 0 ? (
        <LinkContainer key={project.projectId} to={`/projects/${project.projectId}`}>
          <ListGroup.Item>
            <div class="title">
              {project.title.trim().split("\n")[0]}
              {
                project.active
                  ? <Badge variant="primary" className="float-right">Active</Badge>
                  : <Badge variant="secondary" className="float-right">Inactive</Badge>
              }
            </div>
            <div class="subtext">{"Created: " + new Date(project.createdAt).toLocaleDateString()}</div>
          </ListGroup.Item>
        </LinkContainer>
      ) : (
          <LinkContainer key="new" to="/projects/new">
            <ListGroup.Item>
              <b>{"\uFF0B"}</b> Create new project
            </ListGroup.Item>
          </LinkContainer>
        )
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>FL ACES</h1>
        <p></p>
        <div>
          <Link to="/login" className="btn btn-info btn-lg" style={{margin: "20px"}}>
            Login
        </Link>
          <Link to="/signup" className="btn btn-success btn-lg" style={{margin: "20px"}}>
            Signup
        </Link>
        </div>
      </div>
    );
  }

  function renderProjects() {
    return (
      <div className="projects">
        {/*         {!isLoading && 
          <span>{projects.length + " total, " + activeProjects.length + " active"}</span>
        } */}
        <ListGroup>
          {!isLoading && renderProjectsList(projects)}
        </ListGroup>
      </div>
    );
  }

  return (
    <div className="Home">
      {
        //isAuthenticated ? renderProjects() : renderLander()
        renderProjects()
      }
    </div>
  );
}