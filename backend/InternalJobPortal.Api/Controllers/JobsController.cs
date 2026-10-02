using System;
using System.Net;
using System.Web.Http;
using InternalJobPortal.Api.Data;
using InternalJobPortal.Api.Models;

namespace InternalJobPortal.Api.Controllers
{
    [RoutePrefix("api/jobs")]
    public class JobsController : ApiController
    {
        private readonly Db _db = new Db();

        private Models.User GetCurrentUser()
        {
            var auth = Request.Headers.Authorization;
            if (auth == null || auth.Scheme != "Bearer") return null;
            return _db.GetUserByToken(auth.Parameter);
        }

        // GET api/jobs  — any logged-in user
        [HttpGet, Route("")]
        public IHttpActionResult GetAll([FromUri] string status = null)
        {
            var user = GetCurrentUser();
            if (user == null) return Unauthorized();

            // Employees only see Open jobs
            if (user.Role != "admin") status = "Open";

            return Ok(_db.GetJobs(status));
        }

        // GET api/jobs/{id}  — any logged-in user
        [HttpGet, Route("{id:int}")]
        public IHttpActionResult Get(int id)
        {
            var user = GetCurrentUser();
            if (user == null) return Unauthorized();

            var job = _db.GetJobById(id);
            if (job == null) return NotFound();
            return Ok(job);
        }

        // POST api/jobs  — admin only
        [HttpPost, Route("")]
        public IHttpActionResult Create([FromBody] CreateJobRequest req)
        {
            var user = GetCurrentUser();
            if (user == null) return Unauthorized();
            if (user.Role != "admin") return Content(HttpStatusCode.Forbidden, new { message = "Admins only." });

            if (req == null || string.IsNullOrWhiteSpace(req.Title) || string.IsNullOrWhiteSpace(req.Description))
                return BadRequest("Title and description are required.");

            try
            {
                var job = _db.CreateJob(req);
                return Created(new Uri(Request.RequestUri + "/" + job.Id), job);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // PUT api/jobs/{id}  — admin only
        [HttpPut, Route("{id:int}")]
        public IHttpActionResult Update(int id, [FromBody] CreateJobRequest req)
        {
            var user = GetCurrentUser();
            if (user == null) return Unauthorized();
            if (user.Role != "admin") return Content(HttpStatusCode.Forbidden, new { message = "Admins only." });

            if (req == null) return BadRequest("Request body required.");

            bool updated = _db.UpdateJob(id, req);
            if (!updated) return NotFound();
            return Ok(_db.GetJobById(id));
        }

        // DELETE api/jobs/{id}  — admin only
        [HttpDelete, Route("{id:int}")]
        public IHttpActionResult Delete(int id)
        {
            var user = GetCurrentUser();
            if (user == null) return Unauthorized();
            if (user.Role != "admin") return Content(HttpStatusCode.Forbidden, new { message = "Admins only." });

            bool deleted = _db.DeleteJob(id);
            if (!deleted) return NotFound();
            return Ok(new { message = "Job deleted." });
        }
    }
}
