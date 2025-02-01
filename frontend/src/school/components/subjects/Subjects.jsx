import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import { Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { subjectSchema } from '../../../yupSchema/subjectSchema';
import axios from 'axios';
import { baseUrl } from "../../../environment";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [edit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    // Fetch all subjects
    const AllSubjects = () => {
        axios.get(`${baseUrl}/subject/fetch-all`)
            .then(res => setSubjects(res.data.data))
            .catch(e => console.error("Error fetching subjects:", e));
    };

    useEffect(() => {
        AllSubjects();
    }, []);

    const handleEdit = (id) => {
        const subjectToEdit = subjects.find(sub => sub._id === id);
        if (subjectToEdit) {
            setEdit(true);
            setEditId(id);
            formik.setValues({
                subject_name: subjectToEdit.subject_name,
                subject_codename: subjectToEdit.subject_codename
            });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`${baseUrl}/subject/delete/${id}`)
                    .then(res => {
                        if (res.data.success) {
                            AllSubjects();
                            toast.success(res.data.message);
                        } else {
                            toast.error(res.data.message);
                        }
                    })
                    .catch(() => toast.error("Error deleting subject"));
            }
        });
    };

    const cancelEdit = () => {
        setEdit(false);
        setEditId(null);
        formik.resetForm();
    };

    const formik = useFormik({
        initialValues: { subject_name: '', subject_codename: '' },
        validationSchema: subjectSchema,
        onSubmit: (values, { resetForm }) => {
            if (edit) {
                axios.patch(`${baseUrl}/subject/update/${editId}`, values)
                    .then(res => {
                        if (res.data.success) {
                            toast.success(res.data.message);
                            AllSubjects();
                            cancelEdit();
                        } else {
                            toast.error(res.data.message);
                        }
                    })
                    .catch(() => toast.error("Error updating subject"));
            } else {
                axios.post(`${baseUrl}/subject/create`, values)
                    .then(res => {
                        if (res.data.success) {
                            toast.success(res.data.message);
                            AllSubjects();
                            resetForm();
                        } else {
                            toast.error(res.data.message);
                        }
                    })
                    .catch(() => toast.error("Error creating subject"));
            }
        }
    });

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <Box component="form" sx={{ '& > :not(style)': { m: 1 }, display: 'flex', flexDirection: 'column', width: '50vw', minWidth: '300px', margin: 'auto', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }} noValidate autoComplete="off" onSubmit={formik.handleSubmit}>
                <Typography variant='h5' sx={{ fontSize: '40px', color: 'blue', textAlign: 'center' }}>
                    {edit ? 'Edit Subject' : 'Add Subject'}
                </Typography>

                <TextField 
                    name='subject_name' 
                    label="Subject Name" 
                    value={formik.values.subject_name} 
                    onChange={formik.handleChange} 
                    onBlur={formik.handleBlur} 
                    error={formik.touched.subject_name && Boolean(formik.errors.subject_name)} 
                    helperText={formik.touched.subject_name && formik.errors.subject_name} 
                />
                <TextField 
                    name='subject_codename' 
                    label="Subject Codename" 
                    value={formik.values.subject_codename} 
                    onChange={formik.handleChange} 
                    onBlur={formik.handleBlur} 
                    error={formik.touched.subject_codename && Boolean(formik.errors.subject_codename)} 
                    helperText={formik.touched.subject_codename && formik.errors.subject_codename} 
                />

                <Button type='submit' variant='contained' color='primary'>
                    {edit ? 'Update Subject' : 'Add Subject'}
                </Button>
                {edit && <Button onClick={cancelEdit} variant='contained' color='secondary' sx={{ marginTop: 2 }}>Cancel Edit</Button>}
            </Box>

            {/* Subject Table */}
            <TableContainer component={Paper} sx={{ marginTop: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Subject Name</TableCell>
                            <TableCell>Subject Codename</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {subjects.length > 0 ? subjects.map((sub, index) => (
                            <TableRow key={sub._id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{sub.subject_name}</TableCell>
                                <TableCell>{sub.subject_codename}</TableCell>
                                <TableCell>
                                    <Button variant="contained" onClick={() => handleEdit(sub._id)} color="primary" sx={{ marginRight: 2 }}>
                                        <EditIcon />
                                    </Button>
                                    <Button variant="contained" onClick={() => handleDelete(sub._id)} sx={{ backgroundColor: 'red', color: 'white' }}>
                                        <DeleteIcon />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No Data Found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}
