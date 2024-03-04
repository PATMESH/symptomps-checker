const { spawn } = require('child_process');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const runPythonScript = (data) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['app.py', JSON.stringify(data)]);

        let output = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error('Error:', data.toString());
            reject('Internal Server Error');
        });

        pythonProcess.on('close', () => {
            try {
                const responseData = JSON.parse(output);
                resolve(responseData);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                reject('Internal Server Error');
            }
        });
    });
};

app.post('/', async (req, res) => {
    try {
        const { noofsym, symptoms } = req.body;
        const data = { noofsym, symptoms };
        const result = await runPythonScript(data);
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});